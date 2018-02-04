FROM ubuntu:latest
MAINTAINER Jacob Zipper "zipper@jacobzipper.com"
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 4000
ENTRYPOINT ["python"]
CMD ["app.py"]
