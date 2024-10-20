# node-devcontainer-template
Template for starting a node project in a dev container

`chmod +x ./.devcontainer/setup.sh`

To deploy to mohterhouse run

```
npm run build:docker
npm run deploy:motherhouse
```

# Files

ecosystem.config.cjs

This is what runs in the built docker file. It is currently set to run once every day using the `cron_restart` key. This can be removed to stop the restart from happening.