
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
# docker run -ti --rm --env-file ovh-envfile.ini ovh-dns-client /bin/bash
#
# run oneshot:
# docker run -ti --rm --env-file ovh-envfile.ini ovh-dns-client ovh-dns-client ovhDNS records mydomain.io -t

FROM node:20-alpine

ARG USERNAME="node"

USER ${USERNAME}
WORKDIR /home/${USERNAME}

RUN mkdir -p /home/${USERNAME}/ovh-dns-client
COPY . /home/${USERNAME}/ovh-dns-client

RUN cd /home/${USERNAME}/ovh-dns-client && \
    rm -rf ./node_modules ./package-lock.json && \
    npm install

RUN echo 'ovhDNS help\n\
ovhDNS records myzone.net -t\n\
ovhDNS delete myzone.net dummy A 1.2.3.4' > ${HOME}/.bash_history

ENV PATH="${PATH}:/home/${USERNAME}/ovh-dns-client/bin"

CMD ovhDNS
