FROM node:14

WORKDIR /myfolder/
COPY ./package.json /myfolder/
RUN npm install

COPY . /myfolder/

#RUN node index.js 
#여러번 
CMD node index.js
#한번 입력 