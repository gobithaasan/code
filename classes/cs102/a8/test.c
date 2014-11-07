#include <stdio.h>
#include "lib/hash.h"

#define MODSZ 10L

void print_hash(char * str) {
  uint64_t h = hash(str) % MODSZ;
  printf("hash(%s) = %lu\n", str, h);
}

int main(int argc, char * argv[]) {
  int i;
  for (i = 1; i < argc; i++) {
    print_hash(argv[i]);
  }

  return 0;
}
