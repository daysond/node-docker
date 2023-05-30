
# YouTube Video Link: 

## [Learn Docker - DevOps with Node.js & Express](https://youtu.be/9zUHg7xjIqQ)


# Express App Container

## Dockerfile

```Dockerfile
FROM node:18                    # specify image
WORKDIR /app                    # specify work director
COPY package.json .             # copy file to workdir
RUN npm install                 # execute command in build time
COPY . ./                       # copy all files over   
ENV PORT 3000                   # setting enviornment variable
EXPOSE ${PORT}                  # expose port
CMD [ "npm", "run", "dev" ]     # excute command in run time
```

## Commands

- Build image: ```build -t [image_name] [path_of_dockerfile] ```

- List image: ```docker image ls```

- Remove image: ```docker image rm [image id]```

- Run image: ```doccker run -d --name [container_name] [image_name]```

    - with port forwarding:

        ``` docker run -p [local_port]:[container_port] -d --name [container_name] [image_name] ```

    - with mount bind:

        ``` docker run -v (pwd):/app:ro -v /app/node_modules -p [local_port]:[container_port] -d --name [container_name] [image_name] ```

        First -v: binds current director to /app with readonly permission (ro)

        Second -v: creates another volume of /app/node_modules, so that modifying the node_modules on local devices will not affect the node_modules in the container.

    - with enviornment variable:
    
        ``` --env [key]=[value]``` or ```-e [key]=[value]```
    
    - with .env file:
        
        ```--env-file ./.env```

- Show running containers: ```docker ps```

- Remove container with -f (force): ```docker rm [container_name] -f```, delete volume as well: ```docker rm [container_name] -fv ```


- Run bash in container: ```docker exec -it [container_name] bash ```

- Docker volume: ```docker volume ls```

- Delete docker volume: ```docker volume rm [id]```, to delete all use ``` docker volume prune```


## Docker compose

```yml
version: "3"
services:
    [container-name]:
        build: [path]
        ports:
            - "3000:3000"
        
        volumes:
            - ./:/app:ro
            - /app/node_modules

        environment:
            - name=value

        # env_file:
        #     - ./.env
```

Create and run container: ```docker-compose up -d```, -d: detach mode, run in the backgroud

Remove container and volume: ```docker-compose down -v```

Run container with image rebuilt: ```docker-compose up -d --build```

Seperate production and development: seperate common yml, and have one for production and one for development for specific code. 

Run in dev mode command: ```docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d ```

Run in prod mode command: ```docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d ```

Updated docker file so dev dependencies are not installed in production:

```Dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install;\ 
        else npm install --only=production; \
        fi

COPY . ./
ENV PORT 3000
EXPOSE $PORT
CMD [ "node", "index.js" ]
```


# Mongo Container

## Installation using image from docker hub

```yml
version: "3"
services:
  node-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000

  mongo:
    image: mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=dayson
      - MONGO_INITDB_ROOT_PASSWORD=123456
```


## Connect to DB

Command: 

- connect: ```mongosh -u "[username]" -p "[password]" ``` in docker bash

    - or ```docker exec -it [container_name] mongosh -u "[username]" -p "[password]"``` in local terminal

- use db: ```use [db_name]```

- show dbs: ```show dbs```

- insert: ```db.[collection].insertOne({"[attribute]": "[value]"})```

- look up: ```db.[collection].find()```


## Named volume for DB

```yml
version: "3"
services:
  node-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000

  mongo:
    image: mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=dayson
      - MONGO_INITDB_ROOT_PASSWORD=123456
    volumes:
      - mongo-db:/data/db # named volume  name:volume_path

volumes:    # provides volumes to other services
  mongo-db:
```

When tear down the container, use ```docker-compose down``` **without** ```-v```

User ```docker volume prune``` to delete unused volume while containers are **running**

## Connect DB with Express App

### IP address

Finding out ip adress: ```docker inspect [container_name]```

Result would be something like this:

```JSON
...
 "NetworkSettings": {
            "Bridge": "",
            "SandboxID": "47651f8591f0f75f0b97028cdee138b0efd9a08ab25e402bdabd260629532277",
            "HairpinMode": false,
            "LinkLocalIPv6Address": "",
            "LinkLocalIPv6PrefixLen": 0,
            "Ports": {
                "27017/tcp": null
            },
            "SandboxKey": "/var/run/docker/netns/47651f8591f0",
            "SecondaryIPAddresses": null,
            "SecondaryIPv6Addresses": null,
            "EndpointID": "",
            "Gateway": "",
            "GlobalIPv6Address": "",
            "GlobalIPv6PrefixLen": 0,
            "IPAddress": "",
            "IPPrefixLen": 0,
            "IPv6Gateway": "",
            "MacAddress": "",
            "Networks": {
                "node-docker_default": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": [
                        "node-docker-mongo-1",
                        "mongo",
                        "5f8958772e4a"
                    ],
                    "NetworkID": "f103bb720a765d5e76b33f63d64b1ab5026703c8d9cc1367e7231ad8e3e20b4a",
                    "EndpointID": "47c7d77ab3ef802d89cd6a525979b7d6e9246af5755a8ce3403192fcf92836a3",
                    "Gateway": "172.28.0.1",
                    "IPAddress": "172.28.0.2",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "MacAddress": "02:42:ac:1c:00:02",
                    "DriverOpts": null
                }
            }
        }
...

```

### JavaScript code

```js
const mongoose = require('mongoose');
mongoose.connect('mongodb://[username]:[password]@[ip-address]:[port]/?authSource=admin')
// port is default to 27017
```

### Finding out docker IP address beforehand

```docker network ls``` to list all networks

Name of the **service** (the one in yml file) can be used instead of IP address, docker has some sort of **DNS**.

```js
const mongoose = require('mongoose');
mongoose.connect('mongodb://[username]:[password]@mongo:27017/?authSource=admin')
// port is default to 27017
```

### Extra

command to inspect network: ```docker network inspect [container_name]```


## Save DB URL as env variable

**Config.js**

```js
module.exports = {
    MONGO_IP: process.env.MONGO_IP || "mongo",
    MONGO_PORT: process.env.MONGO_PORT || 27017,
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD
}
```

**index.js**

```js
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT } = require('./config/config');
// ...
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

mongoose.connect(mongoURL)
.then(()=> {
    console.log("Successfully connected to database")
})
.catch((e)=>console.log(e))
```

add env variable to **docker-compost.dev.yml**

```yml
    environment:
      # ...
      - MONGO_USER=dayson
      - MONGO_PASSWORD=123456
```

## Add mongo dependency

Ensure that mongo container will start first before the app

```yml
version: "3"
services:
  node-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
    depends_on:       # Added dependency, yet doesn't fully resolve the issue. Therefore, extra logic in app is required. eg. keep trying to connect 
      - mongo

  mongo:
    image: mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=dayson
      - MONGO_INITDB_ROOT_PASSWORD=123456
    volumes:
      - mongo-db:/data/db

volumes:
  mongo-db:
```


Extra logic in index.js

```js
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose.connect(mongoURL)
    .then(()=> {
        console.log("Successfully connected to database")
    })
    .catch((e)=>{
        console.log(e)
        // wait 5 sec then retry
        setTimeout(connectWithRetry, 5000) 
    })
}

connectWithRetry()

```

## To test:

1. only start **node-app**, no dependency

``` docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --no-deps node-app```

2. check the logs, run

 ```docker logs node-docker-node-app-1 -f  ``` 

3. bring up mongo service 

```docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d mongo ```

<br>

# Redis

## docker-compose.yml: offcial image

```yml
services:
  #...
  redis:
    image: redis
```

## config.js

```js
module.exports = {
    // ...
    REDIS_URL: process.env.REDIS_URL || "redis",
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    SESSION_SECRET: process.env.SESSION_SECRET
}
```

## index.js

```js
// import
const session = require("express-session")
const redis = require('redis')
const RedisStore = require('connect-redis').default
const redisClient = redis.createClient({ url: `redis://${REDIS_URL}:${REDIS_PORT}` })

redisClient.connect().catch(console.error)


//....

//middleware
const app = express()
app.use(session({
    proxy: true,
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge:30000      // in ms
    }
}))
```

## Log in to redis database

1. Getting into container: ```docker exec -it [redis_container_name] bash```

2. Getting into db: ```redis-cli```

3. Show all keys: ```KEYS *```

4. Get a key: ```GET [KEY]``` e.g ```GET "sess:GGROJbanuhcjqSiw88F2Av77MJ43xU75"```

## Store user

```js
if(passwordMatched) {
  req.session.user = user
  //...
}
```

# NGINX Load Balancer

![NGINX architecture](./NGINX_lb.png)

## configuration: default.conf

```conf

server {
    listen 80;

    location /api {
        proxy_set_header X-real-IP $remote_addr; // make sure the client ip is passed on
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://node-app:3000; // proxy_pass http://[service_name]:[port];
        proxy_redirect off;
    }
}

```

## docker-compose files:

default

```yml
services:
  nginx:
    image: nginx:stable-alpine
    ports:
      - "3000:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
```

dev:

```yml
  nginx:
    ports:
      - "3000:80"
```

prod:

```yml
  nginx:
    ports:
      - "80:80"
```

## scale node container

```docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --scale node-app=[num_of_instances]```

# Cors: allow front end and api running on different domain

1. install: ```npm install cors```

2. index.js: 

```js
const cors = require("cors")

app.use(cors({
  
}))
```