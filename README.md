# nest-camera-site
Capture images from a nest camera and host in a local server. 

## Configuration
`issueToken`, `cookies` and `apiKey` can be obtain by following the following instruction:
https://github.com/chrisjshull/homebridge-nest#using-a-google-account

`uuid` is the camera uuid you would like to capture. Similar to the instruction linked above, expect that you need to `Filter` for `get_image`. The string after `uuid=` and before `&` is your camera uuid.

These four items needs to be included into config.json. An example of config.json can be find as _config.json.

## Install
After clone the repo, change directory in to the folder.
```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt
npm install
npm run start
```
open a browser and go to the following url: https://[IP]:5000.

## Acknowledgement
Thanks to Humpheh/nest-observe for googe authentication, and dend/foggycam for the idea.
