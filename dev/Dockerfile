#  Copyright 2016 Google Inc.
#
#  Licensed under the Apache License, Version 2.0 (the "License")
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

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