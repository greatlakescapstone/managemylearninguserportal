FROM maven:3.3-jdk-8
WORKDIR /app
COPY ./appfiles .
EXPOSE 8080
ENTRYPOINT [ "java", "-jar", "./mmluserportal.jar" ]
