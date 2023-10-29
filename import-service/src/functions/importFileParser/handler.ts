import { S3Event, S3EventRecord } from "aws-lambda";

import { importService } from "src/service/import.service";

export const importFileParser = async (event: S3Event) => {
  console.log("'importFileParser' lambda was called: ", event);

  try {
    const s3Records: S3EventRecord[] = event.Records;

    for (const record of s3Records) {
      const parsedData = await importService.getParsedData(record);

      if (parsedData) {
        console.log("File successfully parsed", parsedData);
        await importService.moveFile(record);
      }
    }
  } catch (error) {
    console.log(`Internal server error`, error);
  }
};
