# syntax=docker/dockerfile:1.7-labs
# to be able to use "COPY --parents" syntax

# small node container with ovh-dns-client cli tool
# allow to list, add, delete records in OVH managed zone through API
#
# needs credentials in a env file ovh-envfile.ini :
## OVH_DNS_APP_KEY=xxx
## OVH_DNS_APP_SECRET=yyy
## OVH_DNS_CONSUMER_KEY=zzz
# see: https://github.com/chrisWhyTea-zz/ovh-dns-client#readme
#
# build : docker build -t ovh-dns-client .
#
# run interactively :
# docker run -ti --rm --env-file ovh-envfile.ini ovh-dns-client /bin/ash
#
# run oneshot:
# docker run --read-only -ti --rm --env-file ovh-envfile.ini ovh-dns-client ovhDNS records mydomain.io -t

# FROM node:20-alpine
# FROM node:22-alpine
FROM node:24-alpine

ARG USERNAME="node"

USER ${USERNAME}
ENV HOME=/home/${USERNAME}
WORKDIR /home/${USERNAME}

RUN mkdir -p /home/${USERNAME}/ovh-dns-client
COPY ["package.json", "${HOME}/ovh-dns-client/package.json"]

RUN cd /home/${USERNAME}/ovh-dns-client && \
    npm set progress=false && \
    npm config set depth 0 && \
    npm install --omit=dev && \
    npm cache clean --force

COPY --parents *.js bin "/home/${USERNAME}/ovh-dns-client/"
COPY docker_ash_history ${HOME}/.ash_history

ENV PATH="${PATH}:${HOME}/ovh-dns-client/bin"

CMD ["ovhDNS"]
