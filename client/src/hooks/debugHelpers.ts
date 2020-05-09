// None of these methods should make it to production, but are helpful for debugging

var lastProps: any = {};
export const compareProps = (props: any) => {
  console.log("rendering...");
  Object.keys(props).forEach((k) => {
    if (props[k] !== lastProps[k]) {
      console.log(
        `props changed for key ${k} from ${lastProps[k]} to ${props[k]}`
      );
    }
  });
  lastProps = props;
};
