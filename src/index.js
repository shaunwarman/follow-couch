import RegClient from 'npm-registry-client';
import FollowStream from './couch/follow';
import {Transform} from 'stream';

const Client = new RegClient({});

const Assert = require('assert');
const Log = new Transform({ objectMode: true });

const {
    TARGET_EMAIL,
    TARGET_URL,
    TARGET_USERNAME,
    TARGET_PASSWORD,
    SOURCE_USERNAME,
    SOURCE_PASSWORD,
    SOURCE_DB} = process.env;

const target = {
  username: TARGET_USERNAME,
  password: TARGET_PASSWORD,
  email: TARGET_EMAIL,
  alwaysAuth: true
};

const source = {
  username: SOURCE_USERNAME,
  password: SOURCE_PASSWORD
};

Assert(TARGET_PASSWORD, 'Target username not specified');
Assert(TARGET_USERNAME, 'Target password not specified');
Assert(TARGET_URL, 'Target url not specified');

Log._transform = function (chunk, _, cb) {
  let json = JSON.parse(JSON.stringify(chunk));
  let latest = json['dist-tags'].latest;
  let metadata = json.versions[latest];
  let url = metadata.dist.tarball;

  // from source on `change`
  Client.fetch(url, source, (error, response) => {

    let params = {
      access: 'public',
      auth: target,
      body: response,
      metadata
    };

    // publish to target
    Client.publish(TARGET_URL, params, cb);
  });
};

const follower = new FollowStream({
  db: `${SOURCE_URL}/${SOURCE_DB}`,
  since: 'now'
});

follower.pipe(Log);
