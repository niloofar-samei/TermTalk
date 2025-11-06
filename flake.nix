{
  description = "Description for the project";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        # To import a flake module
        # 1. Add foo to inputs
        # 2. Add foo as a parameter to the outputs function
        # 3. Add here: foo.flakeModule

      ];
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      perSystem = { config, self', inputs', pkgs, system, ... }: {
        # Per-system attributes can be defined here. The self' and inputs'
        # module parameters provide easy access to attributes of the same
        # system.

        # Equivalent to  inputs'.nixpkgs.legacyPackages.hello;
        packages.default = pkgs.hello;
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = (with pkgs; [
            nodejs_22
            yarn
            typescript
            react-static
            python313Packages.prisma
            prisma
            postgresql
            postgresql.pg_config
          ]);
          shellHook = ''
            # init the db with
            mkdir -p ./db/ || echo
            export PGDATA="$(pwd)/db"
            export PGHOST="$(pwd)"
            export PGPORT="5432"

            if [[ ! $(grep listen_addresses $PGDATA/postgresql.conf) ]]; then
              echo "db does not exist, creating "
              initdb -D $PGDATA --no-locale --encoding=UTF8

              echo "listen_addresses = 'localhost'" >> $PGDATA/postgresql.conf
              echo "port = $PGPORT" >> $PGDATA/postgresql.conf
              echo "unix_socket_directories = '$PGHOST'" >> $PGDATA/postgresql.conf

              # ...create a database using the name Postgres defaults to.
              echo "CREATE USER postgres SUPERUSER;" | postgres --single -E postgres
              echo "CREATE DATABASE postgres WITH OWNER postgres;" | postgres --single -E postgres
              # ...create a user and database for the project.
              echo "CREATE USER dbuser WITH PASSWORD '11223344';" | postgres --single -E postgres
              echo "CREATE DATABASE termtalk WITH OWNER dbuser" | postgres --single -E postgres
              echo "GRANT ALL PRIVILEGES ON SCHEMA public TO dbuser" | postgres --single -E postgres
            fi

            # postgres &

            ## command to access the db after start
            # psql -h localhost termtalk # or postgres

            ## command to kill the db
            # pg_ctl -D ./db stop

            # trap "pg_ctl -D ./db stop" EXIT
          '';
        };
      };
      flake = {
        # The usual flake attributes can be defined here, including system-
        # agnostic ones like nixosModule and system-enumerating ones, although
        # those are more easily expressed in perSystem.

      };
    };
}
