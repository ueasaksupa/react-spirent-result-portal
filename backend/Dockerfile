FROM node:16.14-alpine

WORKDIR '/app'

COPY ./backend/package.json /app
RUN npm install
COPY ./backend /app
EXPOSE 5001

ENTRYPOINT [ "npm", "run" ]
CMD ["docker"]