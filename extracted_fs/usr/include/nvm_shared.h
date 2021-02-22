// (C) Copyright 2006 Marvell International Ltd.
// All Rights Reserved
//
/******************************************************************************
**
** INTEL CONFIDENTIAL
** Copyright 2000-2005 Intel Corporation All Rights Reserved.
**
** The source code contained or described herein and all documents
** related to the source code (Material) are owned by Intel Corporation
** or its suppliers or licensors.  Title to the Material remains with
** Intel Corporation or its suppliers and licensors. The Material contains
** trade secrets and proprietary and confidential information of Intel
** or its suppliers and licensors. The Material is protected by worldwide
** copyright and trade secret laws and treaty provisions. No part of the
** Material may be used, copied, reproduced, modified, published, uploaded,
** posted, transmitted, distributed, or disclosed in any way without Intel?s
** prior express written permission.
**
** No license under any patent, copyright, trade secret or other intellectual
** property right is granted to or conferred upon you by disclosure or
** delivery of the Materials, either expressly, by implication, inducement,
** estoppel or otherwise. Any license under such intellectual property rights
** must be express and approved by Intel in writing.
**
*****************************************************************************/
#ifndef _NVM_SHARED
#define _NVM_SHARED

#include "global_types.h"
#include "shm_share.h"

/*
   File Name : nvm_shared.h
   Desc	  : Shared file of NVM Server-Client SW Components, define Protocal Messages
   Both SW Entities should use this file
 */

/*YG - 1) change DEF to enum with base
 *      2) add REMOVE FAILED
 *      3) better to minimize error list (why need winerror?)
 *      4) error handler - not handling properly when no diag - no report (maybe need to loop)
 * */

/* the following 2 files are temporarly exist in the crossplatform\nvmclient\inc the it should use the original files that found under softutil\softutil*/
#define FILE_MANAGER  TRUE

#define NVM_LOGICAL_CHANNEL (4)
#define NVM_GPC_SERVICE_NAME "nvm_service"
#define GPC_MAX_DATA_SIZE (1024)        /* including gpc pdu header */
#define GPC_PDU_HEADER_SIZE (4)         /* gpc pdu header */
#define MAX_TX_MSG_SIZE GPC_MAX_DATA_SIZE - GPC_PDU_HEADER_SIZE
#define NVM_MEM_ALLOC(x) malloc(x)
//#define NVMSRV_PORT 2
#define NVMSRV_ADDR  "130.254.1.0"
#define NVMStartReqProcId 0x0001
#define NVMStartCnfProcId 0x0002

/*Note: portqueue.c contain same definition, if want to modify, please modify both*/
#define NVMReqProcId 0x0003
#define NVMCnfProcId 0x0004

#define NVM_DIR_NAME_MAX_LENGHT (6)
#define NVM_FILE_NAME_MAX_LENGHT (NVM_DIR_NAME_MAX_LENGHT + 60)
#define SHM_HEADER_SIZE  sizeof(ShmApiMsg)

typedef enum
{
	NVM_STATUS_SUCCESS = 0x10000, //force to be 4 Bytes wide
	NVM_STATUS_READ_EOF,
	NVM_STATUS_FAILURE,
	NVM_STATUS_API_FAIL_GETDRIVERNAME,
	NVM_STATUS_API_FAIL_OPENDRIVER,
	NVM_STATUS_API_FAIL_IOCTL,
	NVM_STATUS_NON_TRUSTED_CLIENT,
	NVM_STATUS_NO_RESOURCES,
	NVM_STATUS_FAIL_READ_CLIENT_DATA,       //client registry data could not be found
	NVM_STATUS_TB_SIZE_MISMATCH_ERR,        //size field of translation table does not match nimber of records in table
	NVM_STATUS_TB_ENTRY_ERR,                //translation table entry error
	NVM_STATUS_DP_ENTRY_ERR,                //default path entry error
	NVM_STATUS_UNSUPPORTED_CLIENT_POLICY,   // for example : no TTB and only read-only path exists. against system definition
	NVM_STATUS_OPEN_FAILED_MAPPING,         //try to open a file, but mapping to phy path failed.
	NVM_STATUS_OPEN_FILE_NOT_FOUND,         //
	NVM_STSTUS_CLIENT_NOT_FOUND,
	NVM_STATUS_INVALID_FILE_HANDLE,
	NVM_STATUS_CLOSE_FILE_FAILED,
	NVM_STATUS_SEEK_FAILED,
	NVM_STATUS_READ_FAILED,
	NVM_STATUS_WRITE_FAILED,
	NVM_STATUS_WRITE_FAILED_READ_ONLY,
	NVM_STATUS_FLUSH_FAILED,
	//NVM_STATUS_GET_FILE_SIZE_FAILED,
	NVM_STATUS_FILE_FIND_FIRST_FAILED,
	NVM_STATUS_FILE_FIND_NEXT_FAILED,
	////File System Error //////
	///Those are mapped to file errors in winerror.h
	NVM_STATUS_FS_ERROR,
	NVM_STATUS_FS_INVALID_FUNCTION,                         //ERROR_INVALID_FUNCTION
	NVM_STATUS_FS_FILE_NOT_FOUND,                           // ERROR_FILE_NOT_FOUND
	NVM_STATUS_FS_PATH_NOT_FOUND,                           //ERROR_PATH_NOT_FOUND
	NVM_STATUS_FS_TOO_MANY_OPEN_FILES,                      //ERROR_TOO_MANY_OPEN_FILES
	NVM_STATUS_FS_ACCESS_DENIED,                            //ERROR_ACCESS_DENIED
	NVM_STATUS_FS_HANDLE,                                   //ERROR_INVALID_HANDLE
	NVM_STATUS_UNKNOWN,
	NVM_STATUS_ERROR_COUNT

}NVM_STATUS_T;

typedef enum
{
	NVM_SEEK_SET  = 0x10000,   /* seek to an absolute position */   //force to be 4 Bytes wide
	NVM_SEEK_CUR,                                                   /* seek relative to current position */
	NVM_SEEK_END                                                    /* seek relative to end of file */

}NVM_SEEK_ORIGIN;


#define NVM_PROTOCOL_VERSION_MINOR              0
#define NVM_PROTOCOL_VERSION_MAJOR              1

//open defines
#define NVM_DIR_NAME_MAX_LENGTH (6)
#define NVM_FILE_NAME_MAX_LENGTH (NVM_DIR_NAME_MAX_LENGTH + 60)


#define NVM_FILE_ATTRIBUTES_MAX_LENGTH  (4)


typedef UINT32 NVM_OP_CODE;  //Describe the message type, should always be first field of message

#define NVM_FILE_MASK   0x1ff
#define NVM_DIR_MASK    0x200

#define NVM_OP_CODE_HANDSHAKE   0       /* for NVM IPC handshake */
#define NVM_OP_CODE_BASE            1
#define NVM_OP_CODE_FILE_OPEN           1
#define NVM_OP_CODE_FILE_CLOSE          2
#define NVM_OP_CODE_FILE_SEEK           3
//#define NVM_OP_CODE_FILE_GET_SIZE	4
#define NVM_OP_CODE_FILE_FIND_FIRST     4
#define NVM_OP_CODE_FILE_FIND_NEXT      5
#define NVM_OP_CODE_FILE_WRITE          6
#define NVM_OP_CODE_FILE_READ           7
#define NVM_OP_CODE_FILE_REMOVE         8
#define NVM_OP_CODE_RTC_READ        9
#define NVM_OP_CODE_MAX_COMMAND     10

/*typedef enum
   {
    NVM_OP_CODE_FILE_OPEN = 0x10000,        //force to be 4 Bytes wide
    NVM_OP_CODE_FILE_CLOSE,
    NVM_OP_CODE_FILE_SEEK,
    NVM_OP_CODE_FILE_GET_SIZE,
    NVM_OP_CODE_FILE_WRITE,
    NVM_OP_CODE_FILE_READ,
    NVM_OP_CODE_FILE_REMOVE,
    NVM_OP_CODE_MAX_COMMAND
   } NVM_OP_CODE;
 */
/* generic file info struct*/
//ICAT EXPORTED STRUCTURE
typedef struct
{
	char file_name[NVM_FILE_NAME_MAX_LENGTH + 1];
	INT32 time;
	INT32 date;
	UINT32 size;
	UINT32 data_id;         /* FDI identifier for file data */
	INT32 dir_id;           /* use for winCE handler and FDI directory handler*/
	INT32 plr_date;         /* use by FDI */
}NVM_FILE_INFO;

//typedef struct tag_file_info
//{
//   /* filename plus end of string character */
//   FDI_TCHAR file_name[FILE_NAME_SIZE + 1];
//   int       time;          /* updated time stamp when modified */
//   int       date;          /* updated date stamp when modified */
//   DWORD     size;          /* size of file data in bytes */
//   WORD      owner_id;
//   WORD      group_id;
//   WORD      permissions;
//   FILE_ID   data_id;       /* FDI identifier for file data */
//
//   /* the following fields are needed for power loss recovery */
//
//   FILE_ID   plr_id;        /* used for power loss recovery */
//   int       plr_time;      /* used for power loss recovery */
//   int       plr_date;      /* used for power loss recovery */
//   DWORD     plr_size;      /* used for power loss recovery */
//} FILE_INFO;
// Op Code only struct - for "easy" finding/casting the command opcode
typedef struct
{
	NVM_OP_CODE op_code;
} NVM_OP_CODE_ONLY_STRUCT;

// Open Request structures ////////////////////////////////////////////////////
typedef struct
{
	NVM_OP_CODE op_code;
	char szFileName[NVM_FILE_NAME_MAX_LENGTH];
	char szFileAttributes[NVM_FILE_ATTRIBUTES_MAX_LENGTH];
}NVM_FILE_OPEN_REQUEST_STRUCT; //48 Bytes


typedef struct
{
	NVM_OP_CODE op_code;
	NVM_STATUS_T error_code;                //error code of the requested operation
	UINT32 hFile;                           //contains the UINT32 representation of File handle

}NVM_FILE_OPEN_RESPONSE_STRUCT;                 //12 Bytes
/////////////////////////////////////////////////////////////////////////////////


// Close Request structures ////////////////////////////////////////////////////
typedef struct
{
	NVM_OP_CODE op_code;
	UINT32 hFile;                           //contains the UINT32 representation of File handle
}NVM_FILE_CLOSE_REQUEST_STRUCT;                 //8 Bytes

typedef struct
{
	NVM_OP_CODE op_code;
	NVM_STATUS_T error_code;        //error code of the requested operation

}NVM_FILE_CLOSE_RESPONSE_STRUCT;        //8 Bytes
/////////////////////////////////////////////////////////////////////////////////


// Seek Request structures ////////////////////////////////////////////////////
typedef struct
{
	NVM_OP_CODE op_code;
	UINT32 hFile;                                           //contains the UINT32 representation of File handle
	UINT32 nOffset;                                         // offset relative to origin indicator
	NVM_SEEK_ORIGIN nOrigin;                                // where to seek from

}NVM_FILE_SEEK_REQUEST_STRUCT;                                  //16 Bytes

typedef struct
{
	NVM_OP_CODE op_code;
	NVM_STATUS_T error_code;        //error code of the requested operation

}NVM_FILE_SEEK_RESPONSE_STRUCT;         //8 Bytes
/////////////////////////////////////////////////////////////////////////////////


// Get File Size Request structures ////////////////////////////////////////////////////
typedef struct
{
	NVM_OP_CODE op_code;
	char szFileName[NVM_FILE_NAME_MAX_LENGTH];                      // file to retieve lenght for
}NVM_FILE_FIND_FIRST_REQUEST_STRUCT;                                    //44 Bytes

// ICAT EXPORTED STRUCTURE
typedef struct
{
	NVM_OP_CODE op_code;
	NVM_FILE_INFO fileParms;
	NVM_STATUS_T error_code;        //error code of the requested operation
}NVM_FILE_FIND_FIRST_RESPONSE_STRUCT;   // 180 Bytes

typedef struct
{
	NVM_OP_CODE op_code;
	NVM_FILE_INFO fileParms;

}NVM_FILE_FIND_NEXT_REQUEST_STRUCT; // 176 Bytes (depend on the FILE_ID size)

// ICAT EXPORTED STRUCTURE
typedef struct
{
	NVM_OP_CODE op_code;
	NVM_FILE_INFO fileParms;
	NVM_STATUS_T error_code;        //error code of the requested operation
}NVM_FILE_FIND_NEXT_RESPONSE_STRUCT;    // 180 Bytes (depend on the FILE_ID size)


/////////////////////////////////////////////////////////////////////////////////


// Write File Request structures ////////////////////////////////////////////////////
//calculate the size of the data that this request contains
#define WRITE_DATA_SIZE_IN_BYTES                (GPC_MAX_DATA_SIZE - GPC_PDU_HEADER_SIZE - 16)

typedef struct
{
	NVM_OP_CODE op_code;                                            //4 byte
	UINT32 hFile;                                                   //4 bytes
	UINT32 nNumberOfItems;                                          //number of characters to to write from the given file handle 4 bytes
	UINT32 nItemSize;                                               //size of each item in the buffer we are writing 4 Byte
	UINT8 DataBuffer[WRITE_DATA_SIZE_IN_BYTES];                     //this size should be

}NVM_FILE_WRITE_REQUEST_STRUCT;                                         // 1020 Bytes

typedef struct
{
	NVM_OP_CODE op_code;
	NVM_STATUS_T error_code;                                //error code of the requested operation
	UINT32 nNumberActuallItemsWrite;                        //number of characters to to write from the given file handle

}NVM_FILE_WRITE_RESPONSE_STRUCT;                                // 12 Bytes
/////////////////////////////////////////////////////////////////////////////////

// Read File Request structures ////////////////////////////////////////////////////
typedef struct
{
	NVM_OP_CODE op_code;
	UINT32 nItemSize;                       //size of each item in the buffer we are writing
	UINT32 hFile;
	UINT32 nNumberOfItems;                  //number of characters to to write from the given file handle

}NVM_FILE_READ_REQUEST_STRUCT;                  //16 Bytes


#define NVM_READ_DATA_RESPONSE_HEADER_SIZE      (16)
#define READ_DATA_RESPONSE_SIZE_IN_BYTES                (GPC_MAX_DATA_SIZE - GPC_PDU_HEADER_SIZE - 16)

typedef struct
{
	NVM_OP_CODE op_code;
	UINT32 nDataBufferLength;
	NVM_STATUS_T error_code;                                //error code of the requested operation
	UINT32 nNumberActuallItemsRead;                         //number of characters to to write from the given file handle
	UINT8 DataBuffer[READ_DATA_RESPONSE_SIZE_IN_BYTES];
}NVM_FILE_READ_RESPONSE_STRUCT;




// Remove File Request structures ////////////////////////////////////////////////////
typedef struct
{
	NVM_OP_CODE op_code;
	char szFileName[NVM_FILE_NAME_MAX_LENGTH];

}NVM_FILE_REMOVE_REQUEST_STRUCT; //44 Bytes

typedef struct
{
	NVM_OP_CODE op_code;
	NVM_STATUS_T error_code;        //error code of the requested operation
}NVM_FILE_REMOVE_RESPONSE_STRUCT;       //8 Bytes

typedef struct
{
	NVM_OP_CODE op_code;
	int iTmp;
} GPC_RTC_DATA_REQUEST_STRUCT;

typedef struct
{
	NVM_OP_CODE op_code;
	int iTmp;
} GPC_RTC_DATA_RESPONSE_STRUCT;

/////////////////////////////////////////////////////////////////////////////////
typedef struct
{
	NVM_OP_CODE op_code;
	NVM_STATUS_T error_code;    //error code of the requested operation
}RTC_GET_REQUEST_STRUCT;

//ICAT EXPORTED STRUCT
typedef struct
{
	NVM_OP_CODE op_code;
	NVM_STATUS_T error_code;        //error code of the requested operation
	UINT8 second;                   //  Seconds after minute: 0 - 59
	UINT8 minute;                   //  Minutes after hour: 0 - 59
	UINT8 hour;                     //  Hours after midnight: 0 - 23
	UINT8 day;                      //  Day of month: 1 - 31
	UINT8 month;                    //  Month of year: 1 - 12
	UINT16 year;                    //  Calendar year: e.g 2001
}RTC_GET_RESPONSE_STRUCT;



#endif //_NVM_SHARED

