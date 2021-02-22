/******************************************************************************

*(C) Copyright 2007 Marvell International Ltd.

* All Rights Reserved

******************************************************************************/
/****************************************************************************
 *
 * Name:          global_types.h
 *
 * Description:   Standard type definitions
 *
 ****************************************************************************
 *
 *
 *
 *
 ****************************************************************************
 *                  Copyright (c) Intel 2000
 ***************************************************************************/

#ifndef _GLOBAL_TYPES_H_
#define _GLOBAL_TYPES_H_

#ifndef ACI_LNX_KERNEL
#include <stdio.h>      /* for FILENAME_MAX */
#endif
#include "gbl_types.h"
#include "linux_types.h"

///////////////////////////////////////////////////////////////////////////
// UPDATE - Wrap Definition for Linux
///////////////////////////////////////////////////////////////////////////
#if 0
typedef unsigned short WORD;
typedef unsigned int DWORD;
typedef int HANDLE;
typedef HANDLE*         LPHANDLE;
typedef unsigned char*  PUINT8;
typedef long LONG;
typedef char*           LPCTSTR;
typedef char*           LPTSTR;
typedef void*           LPVOID;
typedef unsigned int*   LPDWORD;
typedef unsigned int*   PDWORD;
typedef unsigned int*   PUINT32;
typedef unsigned short TCHAR;
typedef unsigned int UINT;

#endif
///////////////////////////////////////////////////////////////////////////
// END OF UPDATE
///////////////////////////////////////////////////////////////////////////


/* Standard typedefs */
//typedef unsigned char   BOOL;         /* Boolean                        */

#if 0
#ifndef NUCLEUS                         //YG - very dirty !!!!
typedef signed char INT8;               /* Signed 8-bit quantity          */
typedef signed short INT16;             /* Signed 16-bit quantity         */
typedef signed long INT32;              /* Signed 32-bit quantity         */
typedef unsigned char UINT8;            /* Unsigned 8-bit quantity        */
typedef unsigned short UINT16;          /* Unsigned 16-bit quantity       */
typedef unsigned long UINT32;           /* Unsigned 32-bit quantity       */
#endif
#endif

#if 0
typedef volatile UINT8  *V_UINT8_PTR;           /* Ptr to volatile unsigned 8-bit quantity       */
typedef volatile UINT16 *V_UINT16_PTR;          /* Ptr to volatile unsigned 16-bit quantity       */
typedef volatile UINT32 *V_UINT32_PTR;          /* Ptr to volatile unsigned 32-bit quantity       */
#endif
  #define INLINE __inline

//typedef UINT8           BYTE;         /* Unsigned 8-bit quantity        */
//typedef UINT16          WORD;         /* Unsigned 16-bit quantity       */
//typedef UINT32          DWORD;        /* Unsigned 32-bit quantity       */

typedef const char *    SwVersion;

/*  #define FALSE   0
 #define TRUE    1

 #define YES     TRUE
 #define NO      FALSE

 #define ON      1
 #define OFF     0
 */
/* Definition of NULL is required */
//#define NULL    0

  #define DO_FOREVER  while (1)

  #define ENABLED     1
  #define DISABLED    0

/* Handy macros */
  #define MAX(x, y)  (( (x) > (y) ) ? (x) : (y))
  #define MIN(x, y)  (( (x) < (y) ) ? (x) : (y))

/* Bit fields macros */
  #define CONVERT_NUMBER_TO_32BIT_MASK(n)   ((0x00000001L) << ((UINT8)n))

  #define TURN_BIT_ON(r, b)                                     ((r) |= (b))
  #define TURN_BIT_OFF(r, b)                            ((r) &= (~b))

#endif  /* _GLOBAL_TYPES_H_ */

