#
# Makefile for the development environment
#

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

#  __     __         _       _     _
#  \ \   / /_ _ _ __(_) __ _| |__ | | ___ ___
#   \ \ / / _` | '__| |/ _` | '_ \| |/ _ \ __|
#    \ V / (_| | |  | | (_| | |_) | |  __\__ \
#     \_/ \__,_|_|  |_|\__,_|_.__/|_|\___|___/
#

PROJECT?=$(shell gcloud config list project | awk 'FNR ==2 { print $$3 }')
TAG=gcr.io/$(PROJECT)/firebase-multiplayer
NAME=firebase-multiplayer-shell
BUILD_NO_CACHE=false

#Directory that this Makefile is in.
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_path := $(dir $(mkfile_path))
project_path := $(realpath $(current_path)/..)

#   _____                    _
#  |_   _|_ _ _ __ __ _  ___| |_ ___
#    | |/ _` | '__/ _` |/ _ \ __/ __|
#    | | (_| | | | (_| |  __/ |_\__ \
#    |_|\__,_|_|  \__, |\___|\__|___/
#                 |___/

# build the docker dev image
build:
	docker build --no-cache=$(BUILD_NO_CACHE) --tag=$(TAG) $(current_path)

push:
	gcloud docker push $(TAG)

pull:
	gcloud docker pull $(TAG)

#clean up the shell
clean:
	docker rmi $(TAG)

# Start a dev shell
shell:
	mkdir -p ~/.config/gcloud
	mkdir -p ~/.config/configstore
	docker run --rm \
		--name=$(NAME) \
		-P=true \
		-e TERM \
		-e HOST_GID=`id -g` \
		-e HOST_UID=`id -u` \
		-e HOST_USER=$(USER) \
		-v ~/.config/gcloud:/home/$(USER)/.config/gcloud \
		-v ~/.config/configstore:/home/$(USER)/.config/configstore\
		-v ~/.gitconfig:/home/$(USER)/.gitconfig \
		-v $(project_path)/dev/zshrc:/home/$(USER)/.zshrc \
		-v $(project_path):/home/$(USER)/project \
		-w /home/$(USER)/project \
		-it $(TAG) /root/startup.sh

# attach to a running dev shell
shell-attach:
	docker exec -it --user=$(USER) $(NAME) zsh