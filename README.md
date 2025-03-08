# Getting started

## Run MongoDB

You can start MongoDB container like this:

```
docker compose up -d
```

You can enter the docker container's bash terminal with the following command. Run `mongo` in there to inspect the database:

```
docker exec -it mongo bash
```

Open db
```
docker exec -it mongo mongosh
use web-push-notifications
db.subscriptions.find().pretty();
```

## Generate VAPID keys
```
npm install
npx web-push generate-vapid-keys
```

Then set them into `app/config/webpush.ts` and `client/index.js`

## Run the app

After having a running mongo instance, you can execute the following command to start the web application

```
npm start
```

## Links
* https://felixgerschau.com/web-push-notifications-tutorial/

