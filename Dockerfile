FROM node:20-bullseye AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i
COPY . .
RUN npx tsc

# Runtime stage
FROM node:20-bullseye
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
RUN npm i
EXPOSE 7030
CMD ["npm", "start"]