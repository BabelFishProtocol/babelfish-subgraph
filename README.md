# Babelfish Subgraph

Babelfish Subgraph is the main data provider for Babelfish dapp.

Install

- `yarn install`
- `yarn codegen`

# Deployment

## Set up config file

Each network deployment requires setting up a JSON configuration file in `config/<NetworkName>.json`.

## Prepare `subgraph.yaml`

To build proper `subgraph.yaml` for specific network you need to run:

```bash
$ yarn prepare-<NetworkName>
```

rsk and rskTestnet networks are supported.

## Start docker

```bash
$ yarn docker-up
```

## Build

```bash
$ yarn build
```

## Create

```bash
$ yarn run create
```

## Deploy

```bash
$ yarn deploy
```
