export const handleConflictExceptionRequestApprovalWorkflow = (
  dto: any,
  targetKey: string,
  targetValue: string | number
) => {
  let paths = ``;

  const checkDuplicateAndPath = (currentObj: any, currentPath: string) => {
    if (typeof currentObj === `object` && currentObj !== null) {
      for (const key in currentObj) {
        const newPath = currentPath.concat(`,${key}`);
        if (key === targetKey && currentObj[key] === targetValue) {
          paths += newPath;
        }
        checkDuplicateAndPath(currentObj[key], newPath);
      }
    }
  };

  // call function working
  checkDuplicateAndPath(dto, ``);

  // return path
  return convertPath(paths);
};

// this function format path string[index].key
const convertPath = (paths: string) => {
  const convertPath: string | string[] = paths.replace(`,`, '').split(`,`);

  // filter key that can be parsed as numbers
  let newPath = ``;
  convertPath.filter((key: number | string) => {
    if (!isNaN(Number(key))) {
      newPath += `[${key}].`;
    } else if (key === `positionLevelId`) {
      newPath += `${key},`;
    } else {
      newPath += key;
    }
  });

  // remove trailing comma (,) end of string and return new path
  return newPath.slice(0, -1);
};
