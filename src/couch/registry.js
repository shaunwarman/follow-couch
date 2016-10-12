import Wreck from 'wreck';

export default url => ({
  get(id, cb) {
    Wreck.get(
      url + id,
      {json: 'force'},
      (err, _, payload) => cb(err, payload)
    );
  }
});