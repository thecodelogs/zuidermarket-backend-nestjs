# ZuiderMAKKIE REST

## Description

ZuiderMAKKIE REST API written in TypeScript using the [Nest](https://github.com/nestjs/nest) framework.

## Installation
```bash
$ npm install
```

## Running the app
```bash
# local development with backend
$ npm run start:localrest
```

## Database
The live database is found on [DigitalOcean](https://www.digitalocean.com/).

When developing **locally**, use [MySQLWorkbench](https://www.mysql.com/products/workbench/) with a dummy database with the correct port number openend.

This port number must be added to the config file found in config/default.json. By default, **port 3306** is being used.

## Mollie
The [Mollie](https://docs.mollie.com/#) API keys (live and test) can be found on the Mollie Dashboard.

For the live version, those keys must be added in the environment variables of DigitalOcean.

When developing **locally**, Mollie requires ngrok to be running. From there an ngrok endpoint can be found. A test API key must be added to the config file.

## ngrok
[Ngrok](https://ngrok.com/) is used **locally** for payments to create an endpoint between the frontend and the Mollie API.

```bash
# Running ngrok
$ ngrok http 3000
```
Ngrok displays in the terminal:
```bash
Web Interface                 http://127.0.0.1:4040                                                        
Forwarding                    https://b0d6-185-61-55-68.eu.ngrok.io -> http://localhost:3000
```
The first URL, ending by `.nrgok.io`, on the Forwarding line is the endpoint nrgok is creating and this URL should be given to the Webhook endpoint of the Mollie service. All the http requests can be seen using the Web Interface URL.

## redis
[Redis](https://redis.io/) is also required to run a **local** server. 

```bash
# Running redis server
$ redis-server
```
The port redis is using/listening to must be added in the config file. By default, **port 6379** is being used.

## Mailing
When developing **locally**, [FakeSMTP](http://nilhcem.com/FakeSMTP/index.html) or [DevNullSMTP](http://www.aboutmyip.com/AboutMyXApp/DevNullSmtp.jsp) is required in order to catch emails sent from zMAKKIE. 

The port used must be added to the config file. By default, **port 25** is being used.

## Development Cycle
    1) local/branch_name => Local testing
    2) local/branch_name => local/master
    3) local/master => Local testing
    4) local/master => github/master
    5) github/master => github/ocean-testing
    6) github/ocean-testing => Live testing
    7) github/ocean-testing => github/ocean-production


<!-- ## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```



## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

### Ubuntu server

#### Set up Node.js and MariaDB

```bash
sudo apt update
sudo apt install nodejs npm mariadb
MYSQL_SECURE_INSTALLATION
...
sudo mysql -uroot
```

Create database and user.

```mysql
create database zuidermakkie;
create user zuidermakkie identified by 'secret-password';
grant all privileges on zuidermakkie.* to zuidermakkie@'%';
flush privileges;
exit
```

Clone the repository, install, update config and build

```bash
git clone git@github.com:rensjaspers/zuidermakkie-rest.git
cd zuidermakkie-rest
npm install
cp ormconfig.json.example ormconfig.json #(edit add database credentials)
npm run build
```

Set up `systemd`

```bash
sudo vi /etc/systemd/system/zuidermakkie-rest.service
```

Add the following:

```
[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/zuidermakkie-rest
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/src/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start and enable the service

```bash
sudo systemctl start zuidermakkie-rest.service
sudo systemctl enable zuidermakkie-rest.service
``` -->
