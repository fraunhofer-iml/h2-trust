FROM hyperledger/besu:26.1.0-amd64

COPY genesis.json /opt/besu/data/

RUN mkdir alice-data
COPY nodes/alice alice-data/
COPY static-nodes.json alice-data

RUN mkdir bob-data
COPY nodes/bob bob-data/
COPY static-nodes.json bob-data

RUN mkdir carol-data
COPY nodes/carol carol-data/
COPY static-nodes.json carol-data

RUN mkdir dan-data
COPY nodes/dan dan-data/
COPY static-nodes.json dan-data

EXPOSE 8545

COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
