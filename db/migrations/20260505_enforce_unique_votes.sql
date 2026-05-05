-- Run once before deploying the model-level unique vote constraint to an existing MySQL database.
-- Keeps the earliest vote for each user/post pair, removes invalid orphan vote rows, then enforces uniqueness.

DELETE FROM vote
WHERE user_id IS NULL
   OR post_id IS NULL;

DELETE newer_vote
FROM vote AS newer_vote
JOIN vote AS kept_vote
  ON newer_vote.user_id = kept_vote.user_id
 AND newer_vote.post_id = kept_vote.post_id
 AND newer_vote.id > kept_vote.id;

SELECT CONSTRAINT_NAME
INTO @vote_user_fk
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'vote'
  AND COLUMN_NAME = 'user_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL
LIMIT 1;

SET @drop_vote_user_fk = IF(
  @vote_user_fk IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `vote` DROP FOREIGN KEY `', @vote_user_fk, '`')
);
PREPARE drop_vote_user_fk_stmt FROM @drop_vote_user_fk;
EXECUTE drop_vote_user_fk_stmt;
DEALLOCATE PREPARE drop_vote_user_fk_stmt;

SELECT CONSTRAINT_NAME
INTO @vote_post_fk
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'vote'
  AND COLUMN_NAME = 'post_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL
LIMIT 1;

SET @drop_vote_post_fk = IF(
  @vote_post_fk IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `vote` DROP FOREIGN KEY `', @vote_post_fk, '`')
);
PREPARE drop_vote_post_fk_stmt FROM @drop_vote_post_fk;
EXECUTE drop_vote_post_fk_stmt;
DEALLOCATE PREPARE drop_vote_post_fk_stmt;

ALTER TABLE vote
  MODIFY user_id INT NOT NULL,
  MODIFY post_id INT NOT NULL,
  ADD CONSTRAINT user_post_vote_unique UNIQUE (user_id, post_id);

ALTER TABLE vote
  ADD CONSTRAINT vote_user_id_fk
    FOREIGN KEY (user_id) REFERENCES user(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  ADD CONSTRAINT vote_post_id_fk
    FOREIGN KEY (post_id) REFERENCES post(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
