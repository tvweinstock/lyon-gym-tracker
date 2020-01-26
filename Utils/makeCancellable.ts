import PCancelable from 'p-cancelable';
import { resolve } from 'dns';

const makeCancelable = <T>(promise: Promise<T>) =>
  new PCancelable((resolve, reject) => promise.then(resolve, reject));

export default makeCancelable;
