// None of these methods should make it to production, but are helpful for debugging

var renders = 0;
var lastProps: any = {};
export const compareProps = (props: any) => {
  renders++;
  console.log(`rendering ${renders}...`);
  Object.keys(props).forEach((k) => {
    if (props[k] !== lastProps[k]) {
      console.log(
        `props changed for key ${k} from ${lastProps[k]} to ${props[k]}`
      );
    }
  });
  lastProps = props;
};
