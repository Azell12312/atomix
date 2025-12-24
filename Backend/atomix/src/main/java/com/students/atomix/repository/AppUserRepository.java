package com.students.atomix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.students.atomix.model.AppUser;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
}
