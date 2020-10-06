import { makeStyles } from "@material-ui/core/styles";

export default function makePerfProfileCreateStyles() {
  return makeStyles(
    (theme) => {
      return {
        root: {
          width: "100%",
          height: "30vh",
          maxHeight: "512px",
          display: "flex",
          flexDirection: "column",
        },
        dialog: {
          padding: theme.spacing(2),
        },
        loaderContainer: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
        loaderText: {
          marginTop: theme.spacing(3),
        },
        profileBody: {
          marginTop: theme.spacing(1),
        },
        dialogContent: {
          height: "100%",
        },
        textRow: {
          display: "flex",
          marginBottom: theme.spacing(2),
        },
        textLabel: {
          fontSize: "0.75rem",
          position: "relative",
          top: "-5px",
        },
        textSpacer: {
          width: theme.spacing(2),
        },
        content: {
          display: "flex",
          flexDirection: "column",
          flex: "1 0",
        },
        cancelButton: {
          color: theme.palette.text.secondary,
        },
      };
    },
    { name: "PerfProfileCreateDialog" }
  );
}