FROM python:2.7-alpine
RUN apk update && \
    apk add python python-dev libffi-dev gcc make py-pip

RUN mkdir -p /app
COPY . /app
WORKDIR /app
VOLUME ["/app"]

RUN pip install -r requirements.txt

RUN chmod +x /app/start.sh

EXPOSE 8000

ENTRYPOINT ["/app/start.sh"]
