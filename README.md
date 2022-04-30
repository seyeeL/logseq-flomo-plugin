# Logseq Flomo Plugin

Enter your Flomo cookie and token. Fetch Updates will fetch new memos

Selecting a rule and clicking fetching will gather memos and create a page.


## Running the Plugin
npm install && npm run build in terminal to install dependencies.
Load unpacked plugin in Logseq Desktop client.

## Develop
### flomo server proxy
1. open the server directory
```bash
cd server 
```

2. install dependencies
```bash
npm install
```

3. run the server, it will proxy http://localhost:3828 to https://flomoapp.com.
```bash
npm start
```
> It will be moved to another repo in later.


4. open http://localhost:3000
