// resources/js/Components/common/Table.jsx
import React from 'react';

export function Table({ children, className = '', ...props }) {
  return (
    <div className="overflow-x-auto relative shadow rounded-lg">
      <table className={`w-full text-sm text-left text-gray-700 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

Table.Head = function TableHead({ children, className = '', ...props }) {
  return (
    <thead className={`text-xs uppercase bg-gray-50 text-gray-700 ${className}`} {...props}>
      {children}
    </thead>
  );
};

Table.Body = function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

Table.Row = function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={`bg-white border-b hover:bg-gray-50 ${className}`} {...props}>
      {children}
    </tr>
  );
};

Table.Cell = function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </td>
  );
};

Table.HeaderCell = function TableHeaderCell({ children, className = '', ...props }) {
  return (
    <th className={`px-6 py-3 ${className}`} {...props}>
      {children}
    </th>
  );
};