#include <string.h>
#include "../lib/hash.h"

#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define MIN3(a, b, c) MIN(MIN(a, b), c)

uint64_t hash(char * str) {
  uint64_t hash = 5381;
  char ch;
  while ((ch = (*str++)))
    hash = ((hash << 5) + hash) + ch;
  return hash;
}

int32_t string_distance(char *s1, char *s2) {
  uint32_t len1, len2, i, j, ld, od;
  len1 = strlen(s1);
  len2 = strlen(s2);
  uint32_t c[len1+1];
  for (j = 1; j <= len1; j++)
    c[j] = j;
  for (i = 1; i <= len2; i++) {
    c[0] = i;
    for (j = 1, ld = i-1; j <= len1; j++) {
      od = c[j];
      c[j] = MIN3(c[j] + 1, c[j-1] + 1, ld + (s1[j-1] == s2[i-1] ? 0 : 1));
      ld = od;
    }
  }
  return(c[len1]);
}

#undef MIN
#undef MIN3
