FROM node:24 AS frontend-builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN corepack enable
RUN yarn config set nodeLinker node-modules
RUN yarn install

COPY . .

#  __________________________________________________________

# TODO If Running Development Server            (Development)

CMD ["yarn", "dev", "--host", "0.0.0.0"]

#  ___________________________________________________________

# TODO If Serving Build Assets With Nginx       (Release)

# Compile With Vite
#RUN yarn build
# Use Minimal Base Image
#FROM nginx:alpine
# Delete any existing default configurations that may cause conflicts
#RUN rm /etc/nginx/conf.d/default.conf

# Adjust according to your build output folder
#COPY --from=frontend-builder /app/build/client /etc/nginx/html  

#  ______________________________________________________________