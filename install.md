# Installing Status Panel plugin

## Requirements

- [Nodejs >= 20.0.0](https://nodejs.org/en/download/package-manager)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Docker](https://docs.docker.com/get-docker/) for debug with a Grafana container

## Install dependencies

```bash
yarn install
```

## Build plugin

- Development

```bash
webpack -w -c ./.config/webpack/webpack.config.ts --env development
```

- Production

```bash
webpack -c ./.config/webpack/webpack.config.ts --env production
```

> Commands can find in `package.json` file

That creates a `/dist` folder with the plugin files compiled.

## Debug on Grafana

With the `docker-compose.yml` file, you can run a Grafana container with a custom Grafana image which contains debug
tools.
The compose file, add to the `/var/lib/grafana/plugins` folder the plugin files from `/dist`.

```bash
docker-compose build
docker-compose up
```

You can adjust the `docker-compose.yml` file to your needs (image tag version, env var...).

> Attention: don't touch files in the `.config` folder, they are generate and used to create the custom Grafana
> image. [See more](.config/README.md)

**Auto reload** are enabled. Juste save your changes and the plugin will be reloaded in the Grafana without restarting
the container.

## Tests

To run tests, make sure you have **Docker container is up** and installed playwright endToEnd test framework.

```bash
yarn install playwright --with-deps
```

Run test with the following command:

```bash
yarn playwright test
```

## Troubleshooting

### Container not starting with error '/entrypoint' no such file or directory

This error appears when you execute `docker compose up` in **Windows**. To fix it, you need to change the line endings
of the `entrypoint.sh` file from CRLF to LF.
You can use the `dos2unix` command to do that.

```bash
dos2unix .config/entrypoint.sh
```
