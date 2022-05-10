# Babelfish Subgraph

Babelfish Subgraph is the main data provider for Babelfish dapp.

Install

- `yarn install`

# Development

## Set up config file

Each network deployment requires setting up a JSON configuration file in `config/<NetworkName>.json`.

## Build, Deploy and run subgraph for specific network. This will run docker containers on your local machine, execute all needed commands inside:

```bash
$ yarn rsk
```

```bash
$ yarn rsk-testnet
```

# Deployment

## To deploy subgraphs for specific network, you just need to run this command on some server:

```bash
$ yarn rsk
```

```bash
$ yarn rsk-testnet
```

## Remember to generate contracts types on each ABI change.

```bash
generate-contracts-types
```

# Testing

```bash
$ yarn test
```

## To remove all containers started by tests you need to run:

```bash
$ yarn clear-tests-dockers
```
