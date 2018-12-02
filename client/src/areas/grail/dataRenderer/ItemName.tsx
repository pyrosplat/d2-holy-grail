import * as React from "react";
import { Item } from "../../../common/definitions/IItems";
import { ItemPropsDialog } from "./ItemPropsDialog";
import { Icon, createStyles, WithStyles, withStyles, Theme } from "@material-ui/core";
import { HolyGrailDataManager } from "../HolyGrailDataManager";

export interface IItemNameProps {
  item: Item;
  itemName: string;
}

export interface IItemNameState {
  isPropsDialogOpen?: boolean;
  item: Item;
}

const styles = (theme: Theme) =>
  createStyles({
    container: {
      cursor: "pointer",
      display: "flex"
    },
    propsIcon: {
      fontSize: "1.5em",
      marginLeft: theme.spacing.unit
    }
  });

type Props = IItemNameProps & WithStyles<typeof styles>;

class ItemNameComponent extends React.PureComponent<Props, IItemNameState> {
  public constructor(props: Props) {
    super(props);
    this.state = { item: this.props.item };
  }

  public static getDerivedStateFromProps(props: Props, state: IItemNameState) {
    state.item = props.item;
    return state;
  }

  private toggleDialog = (changedProps: { itemNote: string }) => {
    const newState: Partial<IItemNameState> = { isPropsDialogOpen: !this.state.isPropsDialogOpen };

    if (changedProps && changedProps.itemNote !== this.state.item.note) {
      this.state.item.note = changedProps.itemNote;
      HolyGrailDataManager.current.updateGrailCache();
      newState.item = this.state.item;
    }

    this.setState(newState as IItemNameState);
  };

  public render() {
    return (
      <>
        {this.state.isPropsDialogOpen && (
          <ItemPropsDialog onDialogClosed={this.toggleDialog} item={this.props.item} itemName={this.props.itemName} />
        )}
        <div className={this.props.classes.container} onClick={() => this.toggleDialog(null)}>
          <span>{this.props.itemName}</span>
          {this.props.item.note && (
            <Icon className={this.props.classes.propsIcon} title="This item has notes.">
              info
            </Icon>
          )}
        </div>
      </>
    );
  }
}

export const ItemName = withStyles(styles)(ItemNameComponent);