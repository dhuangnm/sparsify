import { makeStyles } from "@material-ui/core/styles";

export default function createOptimStyles() {
  return makeStyles(
    (theme) => {
      return {
        dialog: {
          height: "500px",
          width: "800px",
          overflowY: "hidden",
          padding: theme.spacing(2),
        },
        cancelButton: {
          color: theme.palette.text.secondary,
        },
      };
    },
    { name: "CreateBenchmark" }
  );
}