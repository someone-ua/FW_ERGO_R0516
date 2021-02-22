/* ===========================================================================
   File        : gbl_types.h
   Description : Global types file.

   Notes       : This file includes the types from the correct environment.
	      The environment is set via the ENV_<ENV> macro. This macro
	      is usually set in /env/<host>/build/<env>_env.mak.

   Copyright 2001, Intel Corporation, All rights reserved.
   =========================================================================== */

#if !defined(_GBL_TYPES_H_)
#define _GBL_TYPES_H_

/* Use the Xscale environment types */
#if defined(ENV_XSCALE)
#include "xscale_types.h"
#endif

/* Use the Manitoba environment types */
#if defined(ENV_MANITOBA)
#include "manitoba_types.h"
#endif

/* Use the Arm environment types */
#if defined(ENV_ARM)
#include "arm_types.h"
#endif

/* Use the Gnu environment types */
#if defined(ENV_GNU)
#include "gnu_types.h"
#endif

/* Use the Microsoft Visual C environment types */
#if defined(ENV_MSVC)
#include "msvc_types.h"
#endif

/* Use the Microsoft Smartphone environment types */
#if defined(ENV_STINGER)
#include "stinger_types.h"
#endif

/* Use the Symbian environment types */
#if defined(ENV_SYMBIAN)
#include "symbian_types.h"
#endif

/* Use the POSIX environment types */
#if defined(ENV_LINUX)
#include "linux_types.h"
#endif

#endif /* _GBL_TYPES_H_ */

/*                         end of gbl_types.h
   --------------------------------------------------------------------------- */



