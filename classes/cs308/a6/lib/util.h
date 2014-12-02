#ifndef _LIB_UTIL_H
#define _LIB_UTIL_H

#ifndef NAME_MAX
#define NAME_MAX 512
#endif

#include <sys/types.h>
#include <dirent.h>
#include <sys/stat.h>      // file type/prot macros
#include <sys/sysmacros.h> // major/minor macros
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <pwd.h>
#include <grp.h>
#include <time.h>
#include <limits.h>
#include <string.h>
#include <assert.h>
#include <fcntl.h>
#include "list.h"
#include "term_color.h"

typedef struct fsys_node_s {
  char            d_name[NAME_MAX];
  ino_t           d_ino;
  off_t           d_off;
  unsigned short  d_reclen;
  unsigned char   d_type;
  size_t          depth;
  dev_t           st_dev;         /* ID of device containing file */
  unsigned int    dev_maj;        /* class ID of device containing file */
  unsigned int    dev_min;        /* instance ID of device containing file */
  ino_t           st_ino;         /* inode number */
  mode_t          st_mode;        /* protection */
  nlink_t         st_nlink;       /* number of hard links */
  uid_t           st_uid;         /* user ID of owner */
  gid_t           st_gid;         /* group ID of owner */
  dev_t           st_rdev;        /* device ID (if special file) */
  off_t           st_size;        /* total size, in bytes */
  blksize_t       st_blksize;     /* blocksize for filesystem I/O */
  blkcnt_t        st_blocks;      /* number of 512B blocks allocated */
  time_t          atime;          /* time of last access */
  time_t          mtime;          /* time of last modification */
  time_t          ctime;          /* time of last status change */
  list_t *        sub_nodes;
} fsys_node_t;

list_t * dir_list(const char * dir_name, size_t depth);
void     display_fs_node(void * node_addr);
bool     name_cmp(void * a, void * b);

#endif  // _LIB_UTIL_H