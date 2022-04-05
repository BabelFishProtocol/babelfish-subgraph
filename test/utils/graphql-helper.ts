/**
 * Convert array of strings to graphql array of strings
 */
export const mapToGraphqlArrayOfString = (list: string[]) => {
  let listToGraphqlString = "";
  list.map((element) => {
    listToGraphqlString = listToGraphqlString.length > 0 ? `${listToGraphqlString}, "${element}"` : `"${element}"`;
  })
  return `[${listToGraphqlString}]`;
};
