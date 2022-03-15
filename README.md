# Babelfish Subgraph

Babelfish Subgraph is the main data provider for Babelfish dapp.

Install

- `yarn install`

# Deployment

## Set up config file

Each network deployment requires setting up a JSON configuration file in `config/<NetworkName>.json`.

## Build, Deploy and run subgraph for specific network:

```bash
$ yarn run-<NetworkName>
```

## Or you can do it step by step:

### - Prepare `subgraph.yaml`

To build proper `subgraph.yaml` for specific network you need to run:

```bash
$ yarn prepare-<NetworkName>
```

rsk and rskTestnet networks are supported.

### - Start docker

```bash
$ yarn docker-up
```

### - Build

```bash
$ yarn build
```

### - Create

```bash
$ yarn run create-<NetworkName>
```

### - Deploy

```bash
$ yarn deploy-<NetworkName>
```

# Testing

```bash
$ yarn test
```
