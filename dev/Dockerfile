FROM node

RUN apt-get update && \
    apt-get -y install wget curl less python unzip zsh git make nano

WORKDIR /

#install cloud sdk
RUN wget -q https://dl.google.com/dl/cloudsdk/release/google-cloud-sdk.zip && unzip -q google-cloud-sdk.zip && rm google-cloud-sdk.zip
RUN /google-cloud-sdk/install.sh --usage-reporting=true --path-update=true --bash-completion=true --rc-path=/root/.bashrc
ENV PATH /google-cloud-sdk/bin:$PATH

#install firebase tools
RUN npm install -g firebase-tools

#oh-my-zsh, because how do we live without it?
RUN git clone https://github.com/robbyrussell/oh-my-zsh.git

WORKDIR /root

ADD startup.sh startup.sh
RUN chmod +x startup.sh