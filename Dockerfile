FROM ubuntu

RUN apt-get update

RUN apt-get install -y curl python3

CMD bash -c 'python3 -m http.server & while :; do curl -A "Mozilla/5.0" wttr.in/atlanta?T > index.html; sleep 30; done'
