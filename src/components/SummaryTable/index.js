import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { AutoSizer, Column, SortDirection, Table } from 'react-virtualized';

const styles = theme => ({
  table: {
    fontFamily: theme.typography.fontFamily,
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
    // border: "1px solid blue",
  },
  headerTableCell: {
    fontSize: '15pt',
    // border: '1px solid red',
    justifyContent: 'center'
  },
  dataTableCell: {
    fontSize: '10pt',
    justifyContent: 'center'
  },
  noClick: {
    cursor: 'initial',
  },
});

class MuiVirtualizedTable extends React.PureComponent {
  getRowClassName = ({ index }) => {
    const { classes, rowClassName, onRowClick } = this.props;

    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });
  };

  cellRenderer = ({ cellData, columnIndex = null }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props;
    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer, classes.dataTableCell, {
          [classes.noClick]: onRowClick == null,
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={"center"}
      >
        {cellData}
      </TableCell>
    );
  };

  headerRenderer = ({ label, columnIndex, dataKey, sortBy, sortDirection }) => {
    const { headerHeight, columns, classes, sort } = this.props;
    const direction = {
      [SortDirection.ASC]: 'asc',
      [SortDirection.DESC]: 'desc',
    };

    const inner =
      !columns[columnIndex].disableSort && sort != null ? (
        <TableSortLabel active={dataKey === sortBy} direction={direction[sortDirection]}>
          {label}
        </TableSortLabel>
      ) : (
        label
      );

    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer, classes.noClick, classes.headerTableCell)}
        variant="head"
        style={{ height: headerHeight }}
        align={'center'}
      >
        {inner}
      </TableCell>
    );
  };

  render() {
    const { classes, columns, ...tableProps } = this.props;
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            className={classes.table}
            height={height}
            width={width}
            {...tableProps}
            rowClassName={this.getRowClassName}
          >
            {columns.map(({ cellContentRenderer = null, className, dataKey, ...other }, index) => {
              let renderer;
              if (cellContentRenderer != null) {
                renderer = cellRendererProps =>
                  this.cellRenderer({
                    cellData: cellContentRenderer(cellRendererProps),
                    columnIndex: index,
                  });
              } else {
                renderer = this.cellRenderer;
              }

              return (
                <Column
                  key={dataKey}
                  headerRenderer={headerProps =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  className={classNames(classes.flexContainer, classes.headerTableCell, className)}
                  cellRenderer={renderer}
                  dataKey={dataKey}
                  {...other}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      cellContentRenderer: PropTypes.func,
      dataKey: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
    }),
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowClassName: PropTypes.string,
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  sort: PropTypes.func,
};

MuiVirtualizedTable.defaultProps = {
  headerHeight: 56,
  rowHeight: 56,
};

const WrappedVirtualizedTable = withStyles(styles)(MuiVirtualizedTable);


let id = 0;
function createData(repnumber, squatdepth, shoulderalignment, feetwidth, kneeangle) {
  id += 1;
  return {id, repnumber, squatdepth, shoulderalignment, feetwidth, kneeangle};
}

function ReactVirtualizedTable(props) {

  const rows = [];
  let repStatsList = props.repStatsList;
  let summaryStatus = props.summaryStatus;

  if (summaryStatus) {
      var greenCircle = <i class="fa fa-circle text-success" aria-hidden="true"></i>;
      var yellowCircle = <i class="fa fa-circle text-warning" aria-hidden="true"></i>;
      var redCircle = <i class="fa fa-circle text-danger" aria-hidden="true"></i>;
      let squatDepthColor;
      let shoulderAlignmentColor;
      let feetWidthColor;
      let kneeAngleColor;

      for (let i = 0; i < props.numReps; i++) {
        if(repStatsList[i][0]) {
          //SQUAT DEPTH
          squatDepthColor = greenCircle;
        } else {
          squatDepthColor = redCircle;
        }

        if(repStatsList[i][1]) {
          //SHOULDER ALIGNMENT
          shoulderAlignmentColor = greenCircle;
        } else {
          shoulderAlignmentColor = redCircle;
        }

        if(repStatsList[i][2]) {
          //FEET WIDTH
          feetWidthColor = greenCircle;
        } else {
          feetWidthColor = redCircle;
        }

        if(repStatsList[i][3]) {
          //KNEE ANGLE
          kneeAngleColor = greenCircle;
        } else {
          kneeAngleColor = redCircle;
        }
        rows.push(createData(i+1, squatDepthColor, shoulderAlignmentColor, feetWidthColor, kneeAngleColor));
      }
    }

    summaryStatus = false;


  return (
    <Paper style={{ height: 400, width: '100%' }}>
      <WrappedVirtualizedTable
        rowCount={rows.length}
        rowGetter={({ index }) => rows[index]}
        onRowClick={event => console.log(event)}
        columns={[
          {
            width: 900,
            flexGrow: 1.0,
            label: 'Rep Number',
            dataKey: 'repnumber',
          },
          {
            width: 1025,
            label: 'Squat Depth',
            dataKey: 'squatdepth',
            numeric: true,
          },
          {
            width: 1025,
            label: 'Shoulder Alignment',
            dataKey: 'shoulderalignment',
            numeric: true,
          },
          {
            width: 1025,
            label: 'Feet Width',
            dataKey: 'feetwidth',
            numeric: true,
          },
          {
            width: 1025,
            label: 'Knee Angle',
            dataKey: 'kneeangle',
            numeric: true,
          },
        ]}
      />
    </Paper>
  );
}

export default ReactVirtualizedTable;
