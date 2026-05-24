import type { ReactNode } from 'react';

export type TableColumn<Row> = {
  id: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  align?: 'left' | 'center' | 'right';
};

export type TableProps<Row> = {
  columns: readonly TableColumn<Row>[];
  rows: readonly Row[];
  getRowKey: (row: Row, index: number) => string;
  caption?: ReactNode;
};

export function Table<Row>({ columns, rows, getRowKey, caption }: TableProps<Row>) {
  return (
    <div className="kw-table-wrap">
      <table className="kw-table">
        {caption ? <caption className="kw-table__caption">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th data-align={column.align ?? 'left'} key={column.id} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)}>
              {columns.map((column) => (
                <td data-align={column.align ?? 'left'} key={column.id}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
