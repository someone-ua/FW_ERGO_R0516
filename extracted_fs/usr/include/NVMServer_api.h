/*
 * (C) Copyright 2007 Marvell International Ltd.
 * All Rights Reserved
 */

#ifndef __NVMSERVER_API_H__
#define __NVMSERVER_API_H__

#include "gbl_types.h"
#include "global_types.h"
#include <nvm_shared.h>
#include "NVMServer_defs.h"

#ifndef NVM_CLIENT_ID
#define NVM_CLIENT_ID DWORD
#endif

#ifdef __cplusplus
extern "C" {
#endif

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
NVM_STATUS_T NVMS_FileFindClose( NVM_CLIENT_ID ClientID, ULONG tpMapHandle, LPHANDLE lpSearchHandle );
NVM_STATUS_T NVMS_FileFindFirst(NVM_CLIENT_ID ClientID,
				ULONG tpMapHandle,
				LPCTSTR szFileName,
				NVM_FILE_INFO* pFindResults,
				UINT32* fStatus,
				LPHANDLE lpSearchHandle );
NVM_STATUS_T NVMS_FileFindNext( NVM_CLIENT_ID ClientID,
				ULONG tpMapHandle,
				NVM_FILE_INFO* pFindResults,
				UINT32* fStatus,
				LPHANDLE lpSearchHandle );

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

/*******************************************************************************
* Function:		NVMS_Register
********************************************************************************
* Description:	API for Client to get a ID.
*
* Parameters:	szClientName - Client's name (in)
*				pClientID - Client's ID (out)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_Register( LPCTSTR szClientName, NVM_CLIENT_ID *pClientID);


/*******************************************************************************
* Function:		NVMS_GetFileSize
********************************************************************************
* Description:	API for Client to get specified file size in bytes.
*
* Parameters:	ClientID - Client's ID (in)
*				szFileName - File name (in)
*				pdwSizeHight - file size of high order (out)
*				pdwSizeLow - file size of low order (out)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_GetFileSize( NVM_CLIENT_ID ClientID, LPCTSTR szFileName, PDWORD pdwSizeHigh, PDWORD pdwSizeLow);


/*******************************************************************************
* Function:		NVMS_FileOpen
********************************************************************************
* Description:	API for Client to open specified file
*
* Parameters:	ClientID - Client's ID (in)
*				szFileName - File name (in)
*				szAttrib - Type of access permitted (in)
*				phFile - the pointer to file handle (out)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileOpen( NVM_CLIENT_ID ClientID, ULONG tpMapHandle, LPCTSTR szFileName, LPCTSTR szAttrib, PUINT32 phFile);


/*******************************************************************************
* Function:		NVMS_FileWrite
********************************************************************************
* Description:	API for Client to write data into a file
*
* Parameters:	ClientID - Client's ID (in)
*				hFile - File handle (in)
*				pBuffer - Pointer of data buffer (in)
*				dwBufferLen - Buffer length (in)
*				wItemSize - size of each item in the buffer we are writing (in)
*				dwCount - number of items to write from the given buffer (in)
*				pdwActual  - pointer for number of items actually written (out)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileWrite( NVM_CLIENT_ID ClientID, ULONG tpMapHandle, UINT32 hFile, LPVOID pBuffer, UINT32 dwBufferLen, short wItemSize, UINT32 dwCount, PUINT32 pdwActual);


/*******************************************************************************
* Function:		NVMS_FileFlush
********************************************************************************
* Description:	API for Client to flush a file
*
* Parameters:	ClientID - Client's ID (in)
*				hFile - File handle (in)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileFlush( NVM_CLIENT_ID ClientID, ULONG tpMapHandle, UINT32 hFile);


/*******************************************************************************
* Function:		NVMS_FileSeek
********************************************************************************
* Description:	API for Client to move the file pointer to a specified location
*
* Parameters:	ClientID - Client's ID (in)
*				hFile - File handle (in)
*				dwOffset -  Number of bytes from origin (in)
*				dwOrigin - Initial position (in)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileSeek( NVM_CLIENT_ID ClientID, ULONG tpMapHandle, UINT32 hFile, LONG dwOffset, INT32 dwOrigin);


/*******************************************************************************
* Function:		NVMS_FileRead
********************************************************************************
* Description:	API for Client to read data from a file
*
* Parameters:	ClientID - Client's ID (in)
*				hFile - File handle (in)
*				wItemSize - size of each item in the buffer we are reading (in)
*				dwCount - number of item to read (in)
*				pdwActual  - pointer for number of items actually read (out)
*				pBuffer - Pointer of data buffer (out)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileRead( NVM_CLIENT_ID ClientID, ULONG tpMapHandle, UINT32 hFile, short wItemSize, UINT32 dwCount, PUINT32 pdwActual, LPVOID pBuffer);


/*******************************************************************************
* Function:		NVMS_FileClose
********************************************************************************
* Description:	API for Client to close a file
*
* Parameters:	ClientID - Client's ID (in)
*				hFile - File handle (in)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileClose( NVM_CLIENT_ID ClientID, ULONG tpMapHandle, UINT32 hFile);


/*******************************************************************************
* Function:		NVMS_FileCloseAll
********************************************************************************
* Description:	API for Client to close all files
*
* Parameters:	ClientID - Client's ID (in)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileCloseAll( NVM_CLIENT_ID ClientID);


/*******************************************************************************
* Function:		NVMS_DeRegister
********************************************************************************
* Description:	API for Client to de register
*
* Parameters:	ClientID - Client's ID (in)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_DeRegister( NVM_CLIENT_ID ClientID);

/*******************************************************************************
* Function:		NVMS_FileDelete
********************************************************************************
* Description:	API for Client to de delete
*
* Parameters:	ClientID - Client's ID (in)
*
* Return value:	Return result after this function called
*
* Notes:
*******************************************************************************/
NVM_STATUS_T NVMS_FileDelete( NVM_CLIENT_ID ClientID, LPCTSTR szFileName);

/* NVM extension for flash explorer */
NVM_STATUS_T NVMS_FileRename(NVM_CLIENT_ID ClientID, LPCTSTR szOldFileName, LPCTSTR szNewFileName);
NVM_STATUS_T NVMS_GetFileStat(NVM_CLIENT_ID ClientID, LPCTSTR szFileName, PDWORD pdwStat);
NVM_STATUS_T NVMS_FileChangeMode(NVM_CLIENT_ID ClientID, LPCTSTR szFileName, DWORD dwNewMode);
NVM_STATUS_T NVMS_GetAvailSpace( NVM_CLIENT_ID ClientID, LPCTSTR szVol, PUINT32 pdwSize);
NVM_STATUS_T NVMS_GetTotalSpace( NVM_CLIENT_ID ClientID, PUINT32 pdwSize);
NVM_STATUS_T NVMS_MkDir(NVM_CLIENT_ID ClientID, LPCTSTR szDirName, DWORD dwMode);
NVM_STATUS_T NVMS_RmDir(NVM_CLIENT_ID ClientID, LPCTSTR szDirName);

#ifdef __cplusplus
}
#endif

#endif

