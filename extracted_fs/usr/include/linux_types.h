/* ===========================================================================
   File        : posix_types.h
   Description : Global types file for the POSIX Linux environment.

   Notes       : This file is designed for use in the gnu environment
	      and is referenced from the gbl_types.h file. Use of
			  this file requires ENV_POSIX to be defined in posix_env.mak.

   Copyright 2005, Intel Corporation, All rights reserved.
   =========================================================================== */

#if !defined(_POSIX_TYPES_H_)
#ifdef ACI_LNX_KERNEL
#include <linux/kernel.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/sched.h>
#include <linux/delay.h>
#endif
#include <stdint.h>

#define _POSIX_TYPES_H_

#ifndef UNUSED
#define UNUSED __attribute__((unused))
#endif

#ifndef UNUSEDPARAM
#define UNUSEDPARAM(param) (void)param;
#endif

typedef unsigned char BOOL;
typedef unsigned char UINT8;
typedef unsigned short UINT16;
typedef unsigned int UINT32;
typedef uint64_t UINT64;

typedef signed char CHAR;
typedef signed char INT8;
typedef signed short INT16;
typedef signed int INT32;
typedef int64_t INT64;

typedef unsigned short WORD;
typedef unsigned int DWORD;
typedef int HANDLE;
typedef HANDLE*         LPHANDLE;
typedef unsigned char*  PUINT8;
typedef long LONG;
typedef unsigned long ULONG;
typedef char*           LPCTSTR;
typedef char*           LPTSTR;
typedef void*           LPVOID;
typedef unsigned int*   LPDWORD;
typedef unsigned int*   PDWORD;
typedef unsigned int*   PUINT32;
typedef unsigned short TCHAR;
typedef unsigned int UINT;

typedef INT32   *PINT32;
//typedef UINT32  *PUINT32;
typedef INT16   *PINT16;
typedef UINT16  *PUINT16;
typedef INT8    *PINT8;
//typedef UINT8   *PUINT8;



#ifdef  TRUE
#undef  TRUE
#endif  /* TRUE */
#define TRUE    1

#ifdef  FALSE
#undef  FALSE
#endif  /* FALSE */
#define FALSE   0

#ifndef NULL
#define NULL 0
#endif

#define TEXT(arg) arg
#endif /* _POSIX_TYPES_H_ */

/*                         end of posix_types.h
   --------------------------------------------------------------------------- */



