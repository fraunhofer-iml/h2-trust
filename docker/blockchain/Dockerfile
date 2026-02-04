FROM hyperledger/besu:26.1.0-amd64

USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
USER besu

COPY genesis.json /opt/besu/data/

RUN mkdir alice-data
COPY keys/alice alice-data/
COPY static-nodes.json alice-data

RUN mkdir bob-data
COPY keys/bob bob-data/
COPY static-nodes.json bob-data

RUN mkdir carol-data
COPY keys/carol carol-data/
COPY static-nodes.json carol-data

RUN mkdir dan-data
COPY keys/dan dan-data/
COPY static-nodes.json dan-data

EXPOSE 8545

COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
