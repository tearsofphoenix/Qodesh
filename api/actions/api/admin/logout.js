/**
 * Created by isaac on 2/21/16.
 */

export default function logout(req) {

  return new Promise((resolve, reject) => {
    req.session.destroy(() => {
      req.session = null;
      return resolve({
        redirect: '/login',
        status: 301
      });
    });
  });
}