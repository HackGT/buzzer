FROM ubuntu

RUN apt-get update

RUN apt-get install -y curl

CMD ["curl", "wttr.in/atlanta"]
