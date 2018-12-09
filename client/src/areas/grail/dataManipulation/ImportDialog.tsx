import * as React from "react";
import { createStyles, WithStyles, Typography, Theme, withStyles } from "@material-ui/core";
import DialogContentText from "@material-ui/core/DialogContentText/DialogContentText";
import { GrailManager } from "../GrailManager";
import { Util } from "../../../common/utils/Util";
import { CloseableDialog } from "../../../common/components/CloseableDialog";
import { ButtonWithProgress } from "../../../common/components/ButtonWithProgress";
import { FileUploader } from "../../../common/components/FIleUploader";

export interface IImportDialogProps {
  onDialogClosed: () => any;
}

type Props = IImportDialogProps & WithStyles<typeof styles>;

interface IImportDialogState {
  armor?: string;
  weapons?: string;
  other?: string;
  sets?: string;
  isImporting?: boolean;
  numberOfImportedItems?: number;
}

class ImportDialogInternal extends React.Component<Props, IImportDialogState> {
  public constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <CloseableDialog
        title="Import from CSV"
        onDialogClosed={() => this.props.onDialogClosed()}
        actions={() => (
          <ButtonWithProgress
            isLoading={this.state.isImporting}
            onClick={() => this.import()}
            text="Import"
            isDisabled={
              this.state.numberOfImportedItems != null ||
              (!this.state.armor && !this.state.weapons && !this.state.other && !this.state.sets)
            }
          />
        )}
      >
        {this.state.numberOfImportedItems != null && (
          <DialogContentText className={this.props.classes.successMessage}>
            The import was done! We imported {this.state.numberOfImportedItems} items! Close this dialog and check if
            the data is correct. If it is, simply save the data to the server, if not just discard it!
          </DialogContentText>
        )}
        {this.state.numberOfImportedItems == null && (
          <DialogContentText>
            You can import the data from the{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1Sr7liMtMigd95IwWD6oa3Tky5oEjKzOKAk7pOmdmdCA"
              target="_blank"
            >
              Google Holy Grail Sheet
            </a>{" "}
            here. You have to download each tab as CSV (
            <span style={{ fontStyle: "italic", fontSize: "0.8em" }}>
              File => Download as => Comma-separated values (.csv current sheet)
            </span>
            ) and then upload the file here. You can also only import the tabs you want.
          </DialogContentText>
        )}
        <div>
          {this.getFileUploader("Unique Armor", "armor")}
          {this.getFileUploader("Unique Weapons", "weapons")}
          {this.getFileUploader("Unique Other", "other")}
          {this.getFileUploader("Sets", "sets")}
        </div>
      </CloseableDialog>
    );
  }

  private import = () => {
    this.setState({ isImporting: true });
    const data = GrailManager.current.normalGrail;
    const importedFoundItems: string[] = [];
    this.importSection(data.uniques.armor, this.state.armor, importedFoundItems);
    this.importSection(data.uniques.weapons, this.state.weapons, importedFoundItems);
    this.importSection(data.uniques.other, this.state.other, importedFoundItems);
    this.importSection(data.sets, this.state.sets, importedFoundItems);
    if (importedFoundItems.length) {
      GrailManager.current.updateGrailCache();
    }
    this.setState({ isImporting: false, numberOfImportedItems: importedFoundItems.length });
  };

  private importSection(possibleItem: any, importData: string, importedFoundItems: string[], itemName?: string) {
    if (!importData || !possibleItem) {
      return;
    }

    if (!Util.isItem(possibleItem) || !itemName) {
      Object.keys(possibleItem).forEach(possibleItemName =>
        this.importSection(possibleItem[possibleItemName], importData, importedFoundItems, possibleItemName)
      );
      return;
    }

    const values = importData.split(",");
    for (let i = 0; i < values.length; i++) {
      if (values[i] === itemName) {
        const previousIndex = i - 1;
        if (previousIndex > 0 && values[previousIndex]) {
          possibleItem.wasFound = true;
          importedFoundItems.push(itemName);
        }
        break;
      }
    }
  }

  private getContent(type: string, files: File[]) {
    if (!files || !files.length) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const stateUpdate = {};
      stateUpdate[type] = fileReader.result;
      this.setState(stateUpdate);
    };
    fileReader.readAsText(files[0]);
  }

  private getFileUploader(title: string, stateKey: string) {
    return (
      <div className={this.props.classes.uploadContainer}>
        <Typography variant="subtitle1">{title}</Typography>
        <FileUploader onFilesDropped={(files: File[]) => this.getContent(stateKey, files)} />
      </div>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles({
    closeIcon: {
      position: "absolute",
      top: theme.spacing.unit,
      right: theme.spacing.unit,
      cursor: "pointer"
    },
    uploadContainer: {
      marginTop: theme.spacing.unit
    },
    successMessage: {
      color: theme.palette.secondary.main
    }
  });

export const ImportDialog = withStyles(styles)(ImportDialogInternal);
