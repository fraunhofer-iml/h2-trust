FROM hyperledger/besu:24.8.0-amd64

COPY genesis.json /opt/besu/data/

RUN mkdir alice-data
COPY alice/keys alice-data/
COPY static-nodes.json alice-data

RUN mkdir bob-data
COPY bob/keys bob-data/
COPY static-nodes.json bob-data

RUN mkdir carol-data
COPY carol/keys carol-data/
COPY static-nodes.json carol-data

RUN mkdir dan-data
COPY dan/keys dan-data/
COPY static-nodes.json dan-data

EXPOSE 8545

COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]